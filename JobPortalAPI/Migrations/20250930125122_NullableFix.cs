using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db_apis.Migrations
{
    /// <inheritdoc />
    public partial class NullableFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Users_CreatorUserId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_Greivances_Users_SubmitterUserId",
                table: "Greivances");

            migrationBuilder.AlterColumn<int>(
                name: "SubmitterUserId",
                table: "Greivances",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "CreatorUserId",
                table: "Announcements",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Users_CreatorUserId",
                table: "Announcements",
                column: "CreatorUserId",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Greivances_Users_SubmitterUserId",
                table: "Greivances",
                column: "SubmitterUserId",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Users_CreatorUserId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_Greivances_Users_SubmitterUserId",
                table: "Greivances");

            migrationBuilder.AlterColumn<int>(
                name: "SubmitterUserId",
                table: "Greivances",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatorUserId",
                table: "Announcements",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Users_CreatorUserId",
                table: "Announcements",
                column: "CreatorUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Greivances_Users_SubmitterUserId",
                table: "Greivances",
                column: "SubmitterUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
