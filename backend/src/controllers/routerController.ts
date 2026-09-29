import { Request, Response, NextFunction } from 'express';
import { routerConfigSchema } from '../schemas/validation.js';
import { storageService } from '../services/storageService.js';

export async function getRouters(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'default-user';
    const routers = await storageService.getRouters(userId);

    res.json({
      success: true,
      data: routers
    });
  } catch (error) {
    next(error);
  }
}

export async function createRouter(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = routerConfigSchema.parse(req.body);
    const userId = req.user?.id || 'default-user';

    const router = await storageService.createRouter({
      user_id: userId,
      device_name: validated.deviceName,
      ip_address: validated.ipAddress,
      ssid: validated.ssid,
      notes: validated.notes
    });

    res.status(201).json({
      success: true,
      message: 'Router configuration registered successfully',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRouter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const success = await storageService.deleteRouter(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Router device not found'
      });
    }

    res.json({
      success: true,
      message: 'Router configuration removed'
    });
  } catch (error) {
    next(error);
  }
}
