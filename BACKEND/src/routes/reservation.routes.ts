import { Router } from "express";
import {
  createReservation,
  getReservations,
  confirmReservation
} from "../controllers/reservation.controller";


const router = Router();

router.post("/", createReservation);
router.get("/", getReservations);
router.post("/:id/confirm", confirmReservation);

export default router;
