using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace db_apis.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrentSemester",
                table: "CandidateProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EmailNotifications",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "InterviewReminders",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "JobApplicationUpdates",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MarketingCommunications",
                table: "CandidateProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentSemester",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "EmailNotifications",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "InterviewReminders",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "JobApplicationUpdates",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "MarketingCommunications",
                table: "CandidateProfiles");
        }
    }
}
