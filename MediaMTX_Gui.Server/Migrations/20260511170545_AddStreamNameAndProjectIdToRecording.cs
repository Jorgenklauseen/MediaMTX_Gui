using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddStreamNameAndProjectIdToRecording : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Recordings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreamName",
                table: "Recordings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Recordings_ProjectId",
                table: "Recordings",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recordings_Projects_ProjectId",
                table: "Recordings",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recordings_Projects_ProjectId",
                table: "Recordings");

            migrationBuilder.DropIndex(
                name: "IX_Recordings_ProjectId",
                table: "Recordings");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Recordings");

            migrationBuilder.DropColumn(
                name: "StreamName",
                table: "Recordings");
        }
    }
}
