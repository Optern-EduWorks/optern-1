# TODO: Fix Visibility of Posted Opportunities for Recruiters and Candidates

## Backend Changes
- [x] Add GetByRecruiter endpoint in JobsController to return all jobs for authenticated recruiter without closing date filter

## Frontend Changes
- [x] Add getByRecruiter method in JobService
- [x] Update recruiter-opportunities component to use getByRecruiter instead of getAll

## Testing
- [ ] Verify recruiters can see all their posted jobs (active and expired)
- [ ] Verify candidates still only see active jobs
