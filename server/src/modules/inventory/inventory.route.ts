import { Router } from "express"
import { getBook, getInventory, putBook, searchTextbooks } from "./inventory.service";

const router = Router()

router.get("/", getInventory);

router.get("/textbooks/search", searchTextbooks);

router.get("/textbooks/:id", getBook);

router.put("/textbooks/:id", putBook);

export default router
