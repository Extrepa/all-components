# Feature Implementation Workflow

**Purpose:** Standard workflow for implementing features across projects.

## Workflow Steps

### 1. Planning Phase

**Requirements Gathering:**
- [ ] Understand feature requirements
- [ ] Identify dependencies
- [ ] Estimate complexity
- [ ] Plan implementation approach

**Design:**
- [ ] Design feature architecture
- [ ] Identify components needed
- [ ] Plan data flow
- [ ] Consider edge cases

**Documentation:**
- [ ] Document feature requirements
- [ ] Create implementation plan
- [ ] Update project documentation

### 2. Implementation Phase

**Setup:**
- [ ] Create feature branch
- [ ] Set up development environment
- [ ] Install dependencies (if needed)

**Development:**
- [ ] Implement core functionality
- [ ] Add error handling
- [ ] Implement edge cases
- [ ] Write unit tests

**Integration:**
- [ ] Integrate with existing code
- [ ] Update related components
- [ ] Update state management
- [ ] Update routing (if needed)

### 3. Testing Phase

**Unit Tests:**
- [ ] Write unit tests for utilities
- [ ] Write component tests
- [ ] Test edge cases
- [ ] Verify test coverage

**Integration Tests:**
- [ ] Test feature integration
- [ ] Test with related features
- [ ] Test data flow
- [ ] Test error scenarios

**Manual Testing:**
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Test on different browsers

### 4. Documentation Phase

**Code Documentation:**
- [ ] Add code comments
- [ ] Document complex logic
- [ ] Update type definitions
- [ ] Update JSDoc comments

**User Documentation:**
- [ ] Update README if needed
- [ ] Update user guide if applicable
- [ ] Add feature to changelog

**Developer Documentation:**
- [ ] Update architecture docs
- [ ] Document API changes
- [ ] Update setup instructions

### 5. Review Phase

**Code Review:**
- [ ] Self-review code
- [ ] Request peer review
- [ ] Address review comments
- [ ] Verify all checks pass

**Quality Checks:**
- [ ] Linting passes
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Build succeeds

### 6. Deployment Phase

**Pre-Deployment:**
- [ ] Merge to main branch
- [ ] Verify CI/CD passes
- [ ] Test in staging (if applicable)

**Deployment:**
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Monitor for issues

**Post-Deployment:**
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Gather user feedback

## Feature Implementation Checklist

### Before Starting
- [ ] Feature requirements clear
- [ ] Dependencies identified
- [ ] Implementation plan created
- [ ] Time estimate made

### During Implementation
- [ ] Code follows project standards
- [ ] Tests written as you go
- [ ] Code is well-organized
- [ ] Error handling implemented

### Before Completion
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Build succeeds

### After Completion
- [ ] Feature verified working
- [ ] Documentation complete
- [ ] Changes merged
- [ ] Follow-up tasks identified

## Implementation Patterns

### Component Implementation
1. Create component file
2. Define component interface (props)
3. Implement component logic
4. Add styling
5. Write tests
6. Integrate into app

### Utility Implementation
1. Create utility file
2. Write function signatures
3. Implement functions
4. Write unit tests
5. Export functions
6. Use in components

### Feature Integration
1. Identify integration points
2. Update state management
3. Update routing (if needed)
4. Update navigation (if needed)
5. Test integration
6. Update documentation

## Common Pitfalls

### Avoid
- Implementing without planning
- Skipping tests
- Ignoring error cases
- Not updating documentation
- Breaking existing functionality

### Best Practices
- Plan before coding
- Write tests first (TDD)
- Handle errors properly
- Keep code simple
- Update documentation

## Notes

- Start with the simplest implementation
- Iterate and improve
- Get feedback early
- Don't over-engineer
- Keep user experience in mind
