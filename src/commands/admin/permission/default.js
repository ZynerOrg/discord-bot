const permission = require('../../../db/models/permissionSchema');
const { error, success } = require('../../../handlers');
const fs = require('fs');
module.exports = async (interaction) => {
  const { guild } = interaction;
  let perms = [];

  const commandCategories = fs.readdirSync('./src/commands');

  for (const category of commandCategories) {
    const commands = fs.readdirSync(`./src/commands/${category}`);

    for (const command of commands) {
      const cmd = require(`../../${category}/${command}/index.js`);
      const commandData = cmd.data.toJSON();
      if (cmd.permission.default === true) {
        perms.push(commandData.name);
      }
    }
  }
  const role = interaction.options.getRole('role');
  function roleId(role) {
    if (role) {
      return role.id;
    } else {
      return guild.id;
    }
  }

  const defaultPermDB = await permission.findOne({
    guildID: guild.id,
    roleID: roleId(role),
  });

  if (!defaultPermDB) {
    permission
      .create({ guildID: guild.id, roleID: roleId(role), permissions: perms })
      .then(async () => {
        return success(interaction, {
          title: 'Default Permissions',
          description: `Successfully created default commands: ${perms.map((x) => x)} for role: ${
            role || '@everyone'
          }`,
          ephemeral: true,
          thumbnail: true,
        });
      });
  } else {
    permission
      .updateOne({ guildID: guild.id, roleID: roleId(role) }, { permissions: perms })
      .then(async () => {
        return success(interaction, {
          color: 0x99cc99,
          title: 'Default Permissions',
          description: `Successfully configured commands: ${perms.map((x) => x)} for role: ${
            role || '@everyone'
          }`,
          ephemeral: true,
          thumbnail: true,
        });
      });
  }
};
