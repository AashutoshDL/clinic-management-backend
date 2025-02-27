const Superadmin = require('../../models/superAdminModel');
const bcrypt = require("bcrypt");


// Register Superadmin
module.exports.superadminRegister = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if superadmin already exists
        let superadmin = await Superadmin.findOne({ email });
        if (superadmin) {
            return res.status(400).json({ message: 'Superadmin already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new superadmin
        superadmin = new Superadmin({
            name,
            email,
            password: hashedPassword,
            role: ['superadmin'],  // Setting the role as superadmin
            accountCreated: new Date().toISOString(),  // Adding account creation timestamp
        });

        // Save superadmin to the database
        await superadmin.save();
        return res.status(201).json({ message: 'Superadmin created successfully', superadmin });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

module.exports.getsuperadmins = async (req, res) => {
    try {
      // Fetch all Superadmins from the database
      const superAdmins = await Superadmin.find();
  
      if (!superAdmins.length) {
        return res.status(200).json({ success: false, message: 'No superadmins found' });
      }
  
      res.status(201).json({ success: true, data: superAdmins });
    } catch (error) {
      console.error('Error fetching superadmins:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

// Delete Superadmin by ID
module.exports.deleteSuperadminById = async (req, res) => {
    const { id } = req.params;

    try {
        let superadmin = await Superadmin.findById(id);
        if (!superadmin) {
            return res.status(404).json({ message: 'Superadmin not found' });
        }

        await Superadmin.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Superadmin deleted successfully' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

