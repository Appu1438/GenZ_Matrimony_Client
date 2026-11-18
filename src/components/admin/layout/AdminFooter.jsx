
import packageJson from "../../../../package.json";

const APP_VERSION = packageJson.version;
const AdminFooter = () => (
    <footer className="admin-footer">
        <p>© {new Date().getFullYear()} GenZ Matrimony. All rights reserved.</p>
        <p>Admin Panel v{APP_VERSION}</p>
    </footer>
);

export default AdminFooter;