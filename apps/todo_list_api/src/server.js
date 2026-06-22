import "dotenv/config";
import app from "./app.js";
import { initializeDatabase, closeDatabase } from "./config/database.js";

const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    });

process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing server...");
    closeDatabase()
        .then(() => {
            console.log("Database connection closed");
            process.exit(0);
        })
        .catch((error) => {
            console.error(`Error closing database: ${error.message}`);
            process.exit(1);
        });
});

process.on("SIGINT", () => {
    console.log("SIGINT received, closing server...");
    closeDatabase()
        .then(() => {
            console.log("Database connection closed");
            process.exit(0);
        })
        .catch((error) => {
            console.error(`Error closing database: ${error.message}`);
            process.exit(1);
        });
});
