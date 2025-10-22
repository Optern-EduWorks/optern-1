using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db_apis.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToCandidateProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateProfiles_UserId",
                table: "CandidateProfiles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CandidateProfiles_Users_UserId",
                table: "CandidateProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CandidateProfiles_Users_UserId",
                table: "CandidateProfiles");

            migrationBuilder.DropIndex(
                name: "IX_CandidateProfiles_UserId",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CandidateProfiles");
        }
    }
}
