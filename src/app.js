import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(cookieParser());
app.use(express.static("public"));

//admin routes
import adminEmpRoutes from "./admin/routes/employee.routes.js";
import adminCustomerRoutes from "./admin/routes/customer.routes.js";
import admintruckRoutes from "./admin/routes/truck.routes.js";
import adminSalesRoutes from "./admin/routes/sales.routes.js";
import adminOverviewRoutes from "./admin/routes/overview_dashboard.routes.js";

app.use("/api/admin/employee", adminEmpRoutes);
app.use("/api/admin/customer", adminCustomerRoutes);
app.use("/api/admin/truck", admintruckRoutes);
app.use("/api/admin/sales", adminSalesRoutes);
app.use("/api/admin/overview", adminOverviewRoutes);

//Employee routes
import employeeRoutes from "./routes/employee.routes.js";
app.use("/api/employee", employeeRoutes);

export { app };
