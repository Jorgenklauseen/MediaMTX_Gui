using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDeleteOnUserDeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectInvitations_Users_InvitedByUserId",
                table: "ProjectInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectStreams_Users_CreatedByUserId",
                table: "ProjectStreams");

            migrationBuilder.DropForeignKey(
                name: "FK_Recordings_Users_CreatedById",
                table: "Recordings");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectInvitations_Users_InvitedByUserId",
                table: "ProjectInvitations",
                column: "InvitedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectStreams_Users_CreatedByUserId",
                table: "ProjectStreams",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Recordings_Users_CreatedById",
                table: "Recordings",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectInvitations_Users_InvitedByUserId",
                table: "ProjectInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectStreams_Users_CreatedByUserId",
                table: "ProjectStreams");

            migrationBuilder.DropForeignKey(
                name: "FK_Recordings_Users_CreatedById",
                table: "Recordings");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectInvitations_Users_InvitedByUserId",
                table: "ProjectInvitations",
                column: "InvitedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_CreatedByUserId",
                table: "Projects",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectStreams_Users_CreatedByUserId",
                table: "ProjectStreams",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Recordings_Users_CreatedById",
                table: "Recordings",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
