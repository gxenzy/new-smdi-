
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var react_router_dom_1 = require("react-router-dom");
var icons_material_1 = require("@mui/icons-material");
var NotFound = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    return (<material_1.Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
        }}>
      <material_1.Container maxWidth="md">
        <material_1.Box sx={{ textAlign: 'center' }}>
          <material_1.Typography variant="h1" color="primary" sx={{
            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
            fontWeight: 'bold',
            mb: 2,
        }}>
            404
          </material_1.Typography>
          
          <material_1.Typography variant="h4" color="textPrimary" sx={{ mb: 3, fontWeight: 'medium' }}>
            Page Not Found
          </material_1.Typography>
          
          <material_1.Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </material_1.Typography>

          <material_1.Button variant="contained" size="large" startIcon={<icons_material_1.Home />} onClick={function () { return navigate('/'); }} sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
        }}>
            Back to Home
          </material_1.Button>
        </material_1.Box>
      </material_1.Container>
    </material_1.Box>);
};
export default NotFound;
