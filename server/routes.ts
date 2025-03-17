import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { storage } from "./storage";
import { insertDreamSchema, encouragementSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws",
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    ws.on('error', console.error);
  });

  app.get("/api/dreams", async (_req, res) => {
    const dreams = await storage.getDreams();
    res.json(dreams);
  });

  app.post("/api/dreams", async (req, res) => {
    const result = insertDreamSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const existingDream = await storage.getDreamByEmail(result.data.email);
    if (existingDream) {
      return res.status(400).json({ error: "Email already used" });
    }

    const dream = await storage.createDream(result.data);

    // Notify connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'new_dream', dream }));
      }
    });

    res.json(dream);
  });

  app.post("/api/dreams/:id/like", async (req, res) => {
    try {
      const dream = await storage.likeDream(parseInt(req.params.id));

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'dream_liked', dream }));
        }
      });

      res.json(dream);
    } catch (error) {
      res.status(404).json({ error: "Dream not found" });
    }
  });

  app.post("/api/dreams/:id/encourage", async (req, res) => {
    const result = encouragementSchema.safeParse({
      dreamId: parseInt(req.params.id),
      message: req.body.message
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      const dream = await storage.addEncouragement(result.data.dreamId);

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: 'dream_encouraged',
            dream,
            message: result.data.message
          }));
        }
      });

      res.json(dream);
    } catch (error) {
      res.status(404).json({ error: "Dream not found" });
    }
  });

  return httpServer;
}