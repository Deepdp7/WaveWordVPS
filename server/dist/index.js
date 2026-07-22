"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const plans_routes_1 = __importDefault(require("./routes/plans.routes"));
const subscriptions_routes_1 = __importDefault(require("./routes/subscriptions.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
const invoices_routes_1 = __importDefault(require("./routes/invoices.routes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Security Middlewares
app.use((0, helmet_1.default)());
// Restrict CORS in production
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express_1.default.json());
// Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/plans', plans_routes_1.default);
app.use('/api/subscriptions', subscriptions_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/support/tickets', support_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
