using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectNameToRecording : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProjectName",
                table: "Recordings",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectName",
                table: "Recordings");
        }
    }
}
