using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectStreamFKToRecording : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StreamPath",
                table: "Recordings");

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectStreamId",
                table: "Recordings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recordings_ProjectStreamId",
                table: "Recordings",
                column: "ProjectStreamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recordings_ProjectStreams_ProjectStreamId",
                table: "Recordings",
                column: "ProjectStreamId",
                principalTable: "ProjectStreams",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recordings_ProjectStreams_ProjectStreamId",
                table: "Recordings");

            migrationBuilder.DropIndex(
                name: "IX_Recordings_ProjectStreamId",
                table: "Recordings");

            migrationBuilder.DropColumn(
                name: "ProjectStreamId",
                table: "Recordings");

            migrationBuilder.AddColumn<string>(
                name: "StreamPath",
                table: "Recordings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
