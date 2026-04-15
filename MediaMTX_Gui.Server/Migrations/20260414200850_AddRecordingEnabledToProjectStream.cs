using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRecordingEnabledToProjectStream : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RecordingEnabled",
                table: "ProjectStreams",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecordingEnabled",
                table: "ProjectStreams");
        }
    }
}
