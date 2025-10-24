using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db_apis.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Recruiters",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Recruiters");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CandidateProfiles");
        }
    }
}
