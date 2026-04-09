using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediaMTX_Gui.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectStreams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectStreams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Path = table.Column<string>(type: "TEXT", nullable: false),
                    PublishUser = table.Column<string>(type: "TEXT", nullable: false),
                    StreamKeyHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectStreams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectStreams_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectStreams_Path",
                table: "ProjectStreams",
                column: "Path",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectStreams_ProjectId",
                table: "ProjectStreams",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectStreams");
        }
    }
}
