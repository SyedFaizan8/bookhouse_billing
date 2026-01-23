import { Router } from "express"
import {
    createCustomer,
    createCustomerPayment,
    customerReturns,
    customerStatement,
    getAllCustomers,
    getCustomerInvoices,
    getCustomerProfile,
    getCustomerProfileEdit,
    listCustomerPayments,
    updateCustomer,
} from "./customer.service"

const router = Router()

router.get("/", getAllCustomers);

router.post("/new", createCustomer);

router.get("/:id/profile", getCustomerProfile)

router.get("/:id/invoices", getCustomerInvoices);

router.get('/:id/returns/invoices', customerReturns)

router.post('/:id/payments', createCustomerPayment)

router.get('/:id/payments', listCustomerPayments)

router.get("/:id/statement", customerStatement);

router.get("/:id/edit", getCustomerProfileEdit);

router.put("/:id", updateCustomer)


export default router
