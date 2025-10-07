import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('video')
    .setDescription('Publica un mensaje anunciando un nuevo video.')
    .addStringOption(option =>
      option
        .setName('link')
        .setDescription('Enlace del nuevo video')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const link = interaction.options.getString('link');

    const embed = new EmbedBuilder()
      .setTitle('📢🎬 ¡¡ATENCIÓN GENTE!! 🔔🔥')
      .setDescription(`🚨 **¡YA HAY NUEVO VIDEO EN EL CANAL!** 🚨\n💥 **Corre a verlo ahora mismo:**\n${link}`)
      .setColor(0xFF0000);

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  }
};