import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Cambia el link del comando /abrir")
    .addStringOption(option =>
      option.setName("nuevo")
        .setDescription("El nuevo link")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nuevoLink = interaction.options.getString("nuevo");
    const data = { link: nuevoLink };
    fs.writeFileSync("./link.json", JSON.stringify(data, null, 2));
    await interaction.reply(`✅ Link actualizado correctamente:\n${nuevoLink}`);
  },
};
