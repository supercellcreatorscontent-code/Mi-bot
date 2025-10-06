import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import fs from "fs";

const archivoWarns = "./warns.json";

function cargarWarns() {
  if (!fs.existsSync(archivoWarns)) fs.writeFileSync(archivoWarns, "{}");
  return JSON.parse(fs.readFileSync(archivoWarns, "utf-8"));
}

export default {
  data: new SlashCommandBuilder()
    .setName("warns")
    .setDescription("Ver los warns de un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const warns = cargarWarns();

    if (!warns[usuario.id] || warns[usuario.id].length === 0)
      return interaction.reply({ content: `✅ ${usuario.tag} no tiene warns.`, ephemeral: true });

    let mensaje = `⚠️ Warns de ${usuario.tag}:\n`;
    warns[usuario.id].forEach((w, i) => {
      mensaje += `\n${i + 1}. Motivo: ${w.motivo} - Fecha: ${new Date(w.fecha).toLocaleString()}`;
    });

    interaction.reply({ content: mensaje });
  },
};