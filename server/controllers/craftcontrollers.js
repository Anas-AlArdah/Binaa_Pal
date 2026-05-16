const craftService = require('../services/craftService');

async function getAllCrafts(req, res) {
  try {
    const crafts = await craftService.getCrafts();
    res.status(200).json(crafts);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch crafts',
      error: error.message,
    });
  }
}

async function getCraftBySlug(req, res) {
  try {
    const craft = await craftService.findCraft(req.params.slug);

    if (!craft) {
      return res.status(404).json({ message: 'Craft not found' });
    }

    res.status(200).json(craft);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch craft',
      error: error.message,
    });
  }
}

async function getWorkersByCraft(req, res) {
  try {
    const payload = await craftService.getCraftWorkers(req.params.slug);

    if (!payload) {
      return res.status(404).json({ message: 'Craft not found' });
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch craft workers',
      error: error.message,
    });
  }
}

module.exports = {
  getAllCrafts,
  getCraftBySlug,
  getWorkersByCraft,
};
