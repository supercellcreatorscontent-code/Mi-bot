import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("verificar")
    .setDescription("Verifica a un usuario y cambia su nombre al de Roblox.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("El usuario de Discord a verificar.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("roblox")
        .setDescription("El nombre de Roblox del usuario.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, { client }) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser("usuario");
    const robloxName = interaction.options.getString("roblox");
    const guild = interaction.guild;

    if (!guild) {
      return interaction.editReply("❌ Este comando solo puede usarse dentro de un servidor.");
    }

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.editReply("❌ El usuario no está en este servidor.");
    }

    // Verificar permisos del bot
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.editReply("❌ No tengo permisos para gestionar roles.");
    }
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.editReply("❌ No tengo permisos para cambiar apodos.");
    }

    // Buscar roles (flexible, ignora emojis o mayúsculas)
    const verifiedRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("verificado"));
    const unverifiedRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("no verificado"));

    if (!verifiedRole || !unverifiedRole) {
      return interaction.editReply("❌ No se encontraron los roles 'Verificado' o 'No verificado'.");
    }

    // ⚠️ Comprobar jerarquía del bot
    if (guild.members.me.roles.highest.position <= verifiedRole.position) {
      return interaction.editReply("❌ No puedo asignar el rol Verificado porque está por encima de mi rol.");
    }
    if (guild.members.me.roles.highest.position <= unverifiedRole.position) {
      return interaction.editReply("❌ No puedo quitar el rol No verificado porque está por encima de mi rol.");
    }

    try {
      console.log(`[VERIFY] Añadiendo rol verificado a ${targetUser.tag}`);
      await targetMember.roles.add(verifiedRole);

      console.log(`[VERIFY] Quitando rol no verificado a ${targetUser.tag}`);
      await targetMember.roles.remove(unverifiedRole);

      console.log(`[VERIFY] Cambiando apodo a ${robloxName}`);
      await targetMember.setNickname(robloxName);

      await interaction.editReply({
        content: `✅ **${targetUser.tag}** ha sido verificado como **${robloxName}**.`,
        ephemeral: false
      });

    } catch (error) {
      console.error("Error al verificar usuario:", error);
      await interaction.editReply("❌ Error al verificar usuario. Revisa mis permisos y jerarquía de roles.");
    }
  }
};