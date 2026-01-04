import { Request, Response } from "express";
import { db } from "../services/db.service";

/* ---------------- CREATE RESERVATION ---------------- */

export const createReservation = (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableType,
      specialRequests
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO reservations
      (name, email, phone, reservation_date, reservation_time, guests, table_type, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableType,
      specialRequests
    );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create reservation" });
  }
};

/* ---------------- GET RESERVATIONS ---------------- */

export const getReservations = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT *
      FROM reservations
      ORDER BY reservation_date, reservation_time
    `);

    const rows = stmt.all();

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};


export const confirmReservation = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // find suitable table
    const table = db.prepare(`
      SELECT id FROM tables_reservations
      WHERE status = 'AVAILABLE'
      ORDER BY capacity ASC
      LIMIT 1
    `).get() as {id: number} | undefined;

    if (!table) {
      return res.status(400).json({ message: "No available table" });
    }

    // reserve table
    db.prepare(`
      UPDATE tables_reservations
      SET status = 'RESERVED'
      WHERE id = ?
    `).run(table.id);

    // confirm reservation
    db.prepare(`
      UPDATE reservations
      SET status = 'CONFIRMED', table_id = ?
      WHERE id = ?
    `).run(table.id, id);

    res.json({ message: "Reservation confirmed", tableId: table.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Confirm failed" });
  }
};
