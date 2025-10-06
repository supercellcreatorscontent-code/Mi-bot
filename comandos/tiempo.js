import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tiempo")
    .setDescription("Muestra cuánto tiempo lleva un usuario en el servidor.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("El usuario del que quieres ver el tiempo en el servidor.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");
    const member = await interaction.guild.members.fetch(user.id);

    const joinedAt = member.joinedAt;
    const now = new Date();
    const diff = now - joinedAt;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    await interaction.reply({
      content: `🕒 **${user.tag}** ha estado en el servidor durante **${days} días**, **${hours} horas** y **${minutes} minutos**.`,
      ephemeral: false,
    });
  },
};