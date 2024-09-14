import { type Request,type Response } from "express";
import { z } from "zod";

export function zodMiddleware(err: unknown, req: Request, res: Response): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: err.flatten() });
    return;
  } else if (err instanceof Error) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
}
