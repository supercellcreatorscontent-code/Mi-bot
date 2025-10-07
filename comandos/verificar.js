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

    if (!guild)
      return interaction.editReply("❌ Este comando solo puede usarse dentro de un servidor.");

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember)
      return interaction.editReply("❌ El usuario no está en este servidor.");

    // Verificar permisos del bot
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles) ||
        !guild.members.me?.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.editReply(
        "❌ No tengo permisos suficientes (Gestionar Roles y Cambiar Apodos)."
      );
    }

    // Buscar roles (flexible)
    const verifiedRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("verificado"));
    const unverifiedRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("no verificado"));

    if (!verifiedRole || !unverifiedRole)
      return interaction.editReply("❌ No se encontraron los roles 'Verificado' o 'No verificado'.");

    // ⚠️ Comprobar jerarquía del bot
    if (guild.members.me.roles.highest.position <= verifiedRole.position ||
        guild.members.me.roles.highest.position <= unverifiedRole.position) {
      return interaction.editReply("❌ Mi rol está por debajo de los roles que intento gestionar.");
    }

    try {
      await targetMember.roles.add(verifiedRole);
      await targetMember.roles.remove(unverifiedRole);
      await targetMember.setNickname(robloxName);

      return interaction.editReply({
        content: `✅ **${targetUser.tag}** ha sido verificado como **${robloxName}**.`,
        ephemeral: false
      });
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      return interaction.editReply("❌ Error al verificar usuario. Revisa mis permisos y jerarquía de roles.");
    }
  }
};