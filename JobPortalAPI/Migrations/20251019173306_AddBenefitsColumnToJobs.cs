using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db_apis.Migrations
{
    /// <inheritdoc />
    public partial class AddBenefitsColumnToJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_IndustryLookups_IndustryID",
                table: "Companies");

            migrationBuilder.AddColumn<string>(
                name: "Benefits",
                table: "Jobs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "IndustryID",
                table: "Companies",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_IndustryLookups_IndustryID",
                table: "Companies",
                column: "IndustryID",
                principalTable: "IndustryLookups",
                principalColumn: "IndustryID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_IndustryLookups_IndustryID",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Benefits",
                table: "Jobs");

            migrationBuilder.AlterColumn<int>(
                name: "IndustryID",
                table: "Companies",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_IndustryLookups_IndustryID",
                table: "Companies",
                column: "IndustryID",
                principalTable: "IndustryLookups",
                principalColumn: "IndustryID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
