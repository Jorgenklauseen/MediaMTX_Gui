using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMediaStream : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recordings_Streams_StreamId",
                table: "Recordings");

            migrationBuilder.DropTable(
                name: "Streams");

            migrationBuilder.DropIndex(
                name: "IX_Recordings_StreamId",
                table: "Recordings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Streams",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Format = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Streams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recordings_StreamId",
                table: "Recordings",
                column: "StreamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recordings_Streams_StreamId",
                table: "Recordings",
                column: "StreamId",
                principalTable: "Streams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
