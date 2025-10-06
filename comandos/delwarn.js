import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import fs from "fs";

const archivoWarns = "./warns.json";

function cargarWarns() {
  if (!fs.existsSync(archivoWarns)) fs.writeFileSync(archivoWarns, "{}");
  return JSON.parse(fs.readFileSync(archivoWarns, "utf-8"));
}

function guardarWarns(data) {
  fs.writeFileSync(archivoWarns, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("delwarn")
    .setDescription("Quitar un warn a un usuario")
    .addUserOption(option =>
      option.setName("usuario").setDescription("Usuario a quitar el warn").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("numero").setDescription("Número del warn a eliminar").setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
      return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });

    const usuario = interaction.options.getUser("usuario");
    const numero = interaction.options.getInteger("numero");

    const warns = cargarWarns();
    if (!warns[usuario.id] || warns[usuario.id].length < numero || numero <= 0)
      return interaction.reply({ content: "❌ Warn no encontrado.", ephemeral: true });

    const eliminado = warns[usuario.id].splice(numero - 1, 1);
    if (warns[usuario.id].length === 0) delete warns[usuario.id];

    guardarWarns(warns);

    interaction.reply({ content: `✅ Warn #${numero} de ${usuario.tag} eliminado. Motivo eliminado: ${eliminado[0].motivo}` });
  },
};