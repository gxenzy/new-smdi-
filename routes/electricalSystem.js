const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ElectricalSystem = require('../models/ElectricalSystem');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/electrical-system/components
// @desc    Get all electrical components
// @access  Private
router.get('/components', auth, async (req, res) => {
  try {
    const components = await ElectricalSystem.find();
    res.json(components);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/electrical-system/components
// @desc    Add a new electrical component
// @access  Private
router.post('/components', auth, async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      specifications,
      load,
      voltage,
      current,
      powerFactor,
      status
    } = req.body;

    const component = new ElectricalSystem({
      name,
      type,
      location,
      specifications,
      load,
      voltage,
      current,
      powerFactor,
      status,
      createdBy: req.user.id
    });

    await component.save();

    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('electricalSystemUpdate', component);
    }

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'CREATE',
      module: 'ELECTRICAL_SYSTEM',
      details: {
        message: 'Added new electrical component',
        componentId: component._id,
        componentName: component.name
      }
    });

    res.status(201).json(component);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/electrical-system/components/:id
// @desc    Update an electrical component
// @access  Private
router.put('/components/:id', auth, async (req, res) => {
  try {
    const component = await ElectricalSystem.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    // Update fields
    const updateFields = [
      'name', 'type', 'location', 'specifications',
      'load', 'voltage', 'current', 'powerFactor', 'status'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        component[field] = req.body[field];
      }
    });

    component.lastModifiedBy = req.user.id;
    component.lastModifiedAt = Date.now();

    await component.save();

    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('electricalSystemUpdate', component);
    }

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      module: 'ELECTRICAL_SYSTEM',
      details: {
        message: 'Updated electrical component',
        componentId: component._id,
        componentName: component.name,
        changes: req.body
      }
    });

    res.json(component);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/electrical-system/components/:id
// @desc    Delete an electrical component
// @access  Private
router.delete('/components/:id', auth, async (req, res) => {
  try {
    const component = await ElectricalSystem.findById(req.params.id);
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    await component.remove();

    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('electricalSystemUpdate', { deletedId: req.params.id });
    }

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'DELETE',
      module: 'ELECTRICAL_SYSTEM',
      details: {
        message: 'Deleted electrical component',
        componentId: component._id,
        componentName: component.name
      }
    });

    res.json({ message: 'Component removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/electrical-system/layout
// @desc    Get electrical system layout
// @access  Private
router.get('/layout', auth, async (req, res) => {
  try {
    const components = await ElectricalSystem.find();
    
    // Group components by location
    const layout = components.reduce((acc, component) => {
      if (!acc[component.location]) {
        acc[component.location] = [];
      }
      acc[component.location].push(component);
      return acc;
    }, {});

    // Calculate total load per location
    const locationStats = Object.keys(layout).map(location => ({
      location,
      components: layout[location].length,
      totalLoad: layout[location].reduce((sum, comp) => sum + comp.load, 0),
      activeComponents: layout[location].filter(comp => comp.status === 'active').length
    }));

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'VIEW',
      module: 'ELECTRICAL_SYSTEM',
      details: { message: 'Retrieved electrical system layout' }
    });

    res.json({
      layout,
      statistics: {
        totalComponents: components.length,
        totalLoad: components.reduce((sum, comp) => sum + comp.load, 0),
        activeComponents: components.filter(comp => comp.status === 'active').length,
        locationStats
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/electrical-system/import
// @desc    Import electrical system data
// @access  Private
router.post('/import', auth, async (req, res) => {
  try {
    const { components } = req.body;

    if (!Array.isArray(components)) {
      return res.status(400).json({ message: 'Invalid import data format' });
    }

    const importedComponents = [];
    const errors = [];

    // Process each component
    for (const comp of components) {
      try {
        const component = new ElectricalSystem({
          ...comp,
          createdBy: req.user.id
        });
        await component.save();
        importedComponents.push(component);
      } catch (error) {
        errors.push({
          component: comp.name,
          error: error.message
        });
      }
    }

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'IMPORT',
      module: 'ELECTRICAL_SYSTEM',
      details: {
        message: 'Imported electrical system data',
        successCount: importedComponents.length,
        errorCount: errors.length
      }
    });

    res.json({
      message: 'Import completed',
      imported: importedComponents.length,
      errors,
      components: importedComponents
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/electrical-system/export
// @desc    Export electrical system data
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const components = await ElectricalSystem.find();

    // Format data for export
    const exportData = {
      metadata: {
        exportDate: new Date(),
        exportedBy: req.user.id,
        totalComponents: components.length
      },
      components: components.map(comp => ({
        name: comp.name,
        type: comp.type,
        location: comp.location,
        specifications: comp.specifications,
        load: comp.load,
        voltage: comp.voltage,
        current: comp.current,
        powerFactor: comp.powerFactor,
        status: comp.status
      }))
    };

    // Log activity
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'EXPORT',
      module: 'ELECTRICAL_SYSTEM',
      details: {
        message: 'Exported electrical system data',
        componentCount: components.length
      }
    });

    res.json(exportData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
