import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("verificar")
    .setDescription("Verifica a un usuario y cambia su nombre al de Roblox")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("El usuario de Discord a verificar")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("roblox")
        .setDescription("El nombre de Roblox del usuario")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Solo staff puede usarlo

  async execute(interaction, { client }) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser("usuario");
    const robloxName = interaction.options.getString("roblox");

    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply("❌ Este comando solo puede usarse en un servidor.");
    }

    // Obtener el miembro del servidor (GuildMember), no solo el User
    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.editReply("❌ El usuario no está en este servidor.");
    }

    // Verificar que el bot tenga los permisos necesarios
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.editReply("❌ No tengo permisos para gestionar roles.");
    }
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.editReply("❌ No tengo permisos para cambiar apodos.");
    }

    // Buscar roles por nombre
    const verifiedRole = guild.roles.cache.find(r => r.name === "Verificado ✅");
    const unverifiedRole = guild.roles.cache.find(r => r.name === "No verificado ❌");

    if (!verifiedRole || !unverifiedRole) {
      return interaction.editReply("❌ No se encontraron los roles 'Verificado ✅' o 'No verificado ❌'.");
    }

    try {
      // Añadir rol verificado y quitar no verificado
      await targetMember.roles.add(verifiedRole);
      await targetMember.roles.remove(unverifiedRole);

      // Cambiar el apodo al nombre de Roblox
      await targetMember.setNickname(robloxName);

      // Responder con éxito (público si lo deseas, o mantener ephemeral)
      await interaction.editReply({
        content: `✅ ${targetUser.tag} ha sido verificado como **${robloxName}**.`,
        ephemeral: false // Cambia a `true` si quieres que sea privado
      });
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      await interaction.editReply("❌ Ocurrió un error al verificar al usuario. ¿Tengo los permisos correctos?");
    }
  }
};