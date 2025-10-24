# TODO: Add Withdraw Application Feature

## Tasks
- [x] Add withdrawApplication method in applications.ts
- [x] Add "Withdraw Application" button in modal footer of applications.html
- [ ] Test the withdraw functionality

## Details
- The backend delete endpoint is already implemented in ApplicationsController.cs
- The method should confirm with user, call delete API, reload applications, close modal
- Button should be styled appropriately and only shown for applications that can be withdrawn (e.g., not rejected)
