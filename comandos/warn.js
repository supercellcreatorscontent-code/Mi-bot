import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Dar un warn a un usuario")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a advertir").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del warn").setRequired(true)),

  async execute(interaction, { cargarWarns, guardarWarns, client }) {
    const usuario = interaction.options.getUser("usuario");
    const mention = `<@${usuario.id}>`;
    const motivo = interaction.options.getString("motivo");
    const member = await interaction.guild.members.fetch(usuario.id);
    const warns = cargarWarns();

    if (!warns[usuario.id]) warns[usuario.id] = [];
    const cantidadWarns = warns[usuario.id].length + 1;

    let duracion = 0;
    let accion = "";

    if (cantidadWarns === 1) { duracion = 10 * 60 * 1000; accion = "mute"; }
    else if (cantidadWarns === 2) { duracion = 60 * 60 * 1000; accion = "mute"; }
    else if (cantidadWarns === 3) { duracion = 2 * 60 * 60 * 1000; accion = "mute"; }
    else if (cantidadWarns === 4) { duracion = 24 * 60 * 60 * 1000; accion = "mute"; }
    else if (cantidadWarns === 5) { duracion = 48 * 60 * 60 * 1000; accion = "mute"; }
    else if (cantidadWarns >= 6) { accion = "ban"; }

    const finAccion = duracion ? new Date(Date.now() + duracion).toISOString() : null;
    warns[usuario.id].push({ motivo, fecha: new Date().toISOString(), accion, finAccion });
    guardarWarns(warns);

    const muteRole = interaction.guild.roles.cache.find(r => r.name === "Muted");

    if (accion === "mute" && muteRole) {
      await member.roles.add(muteRole).catch(() => {});
      setTimeout(() => member.roles.remove(muteRole).catch(() => {}), duracion);
    }

    if (accion === "ban") {
      await member.ban({ days: 1, reason: motivo }).catch(() => {});
    }

    interaction.reply({ content: `⚠️ ${mention} recibió warn #${cantidadWarns}. Acción: ${accion}. Motivo: ${motivo}` });
  },
};