# Documentation Structure

This document explains the organization of documentation in the Feast Finder repository.

## Core Documentation Files

These are the primary, actively maintained documentation files that should be kept up-to-date with all code changes:

### User-Facing Documentation

- **README.md** - Main project overview
  - Features list
  - Tech stack
  - Getting started guide
  - Setup instructions for all integrations
  - Sample data overview
  - Development commands

### Technical Documentation

- **IMPLEMENTATION.md** - Complete implementation details
  - Application architecture
  - Key features walkthrough
  - Backend functions and schema
  - Frontend components
  - User flows
  - Technical highlights

- **UI-DESIGN.md** - UI/UX design specification
  - Visual layouts and mockups
  - Color palette (light/dark mode)
  - Typography
  - Interactive elements
  - Responsive behavior
  - Accessibility considerations

### Integration Documentation

- **AUTHENTICATION.md** - Convex Auth integration
  - Architecture overview
  - Setup instructions
  - User flows
  - Security considerations
  - Extension guides
  - Troubleshooting

- **AUTUMN_INTEGRATION.md** - Premium features with Autumn
  - Setup and configuration
  - Feature gating implementation
  - Premium user flows
  - Security considerations
  - Adding new premium features

- **GEOSPATIAL.md** - Convex Geospatial Component
  - Architecture
  - Available queries
  - Data synchronization
  - Frontend integration
  - Performance considerations

- **FIRECRAWL_INTEGRATION.md** - Web scraping integration
  - Setup instructions
  - Usage examples
  - Data extraction process
  - Storage strategy
  - API reference

- **SENTRY_IMPLEMENTATION.md** - Error tracking and monitoring
  - Features overview
  - Setup and configuration
  - Testing instructions
  - Monitoring guidelines
  - Best practices

### Developer Notes

- **CODEGEN_NOTE.md** - Convex code generation
  - When to run codegen
  - Generated files explanation
  - Troubleshooting

## Historical Documentation Files

These files represent point-in-time implementation notes and may contain outdated information:

### Implementation Summaries

- **IMPLEMENTATION_SUMMARY.md** - Authentication implementation snapshot
  - Historical record of authentication feature implementation
  - May contain outdated function names or workflows
  - Consider archiving or removing

- **AUTUMN_IMPLEMENTATION_SUMMARY.md** - Autumn integration snapshot
  - Historical record of premium features implementation
  - Implementation decisions and rationale
  - Consider archiving or removing

### UI Change Logs

- **UI_CHANGES.md** - Authentication UI changes
  - Documented UI changes when authentication was added
  - Visual design decisions
  - Consider archiving or removing

- **UI_CHANGES_AUTUMN.md** - Autumn UI changes
  - Documented UI changes when premium features were added
  - Filter panel design
  - Consider archiving or removing

## Documentation Maintenance Guidelines

### When to Update Documentation

Documentation **must** be updated when:

1. **Adding or modifying features**
   - Update README.md feature list
   - Update IMPLEMENTATION.md with technical details
   - Update UI-DESIGN.md if UI changes

2. **Changing database schema**
   - Update IMPLEMENTATION.md schema section
   - Update relevant integration docs (GEOSPATIAL.md, FIRECRAWL_INTEGRATION.md)

3. **Adding/removing Convex functions**
   - Update IMPLEMENTATION.md functions section
   - Update relevant integration docs

4. **Modifying authentication**
   - Update AUTHENTICATION.md

5. **Changing premium features**
   - Update AUTUMN_INTEGRATION.md
   - Update README.md premium features section

6. **UI/UX changes**
   - Update UI-DESIGN.md
   - Take screenshots if significant visual changes

7. **Integration changes**
   - Update respective integration documentation
   - Update README.md setup instructions

### What to Document

- **Do document:**
  - Current implementation details
  - Setup and configuration steps
  - User flows and interactions
  - API reference and function signatures
  - Troubleshooting common issues
  - Architecture decisions

- **Don't document:**
  - Implementation history (unless critical for understanding)
  - Temporary workarounds (fix them instead)
  - Obvious code comments (code should be self-explanatory)
  - Duplicate information across multiple files

### Documentation Best Practices

1. **Keep it current** - Outdated documentation is worse than no documentation
2. **Be concise** - Developers prefer brief, clear explanations
3. **Use examples** - Code examples are more valuable than long descriptions
4. **Link between docs** - Cross-reference related documentation
5. **Test instructions** - Verify setup instructions actually work
6. **Update atomically** - Update docs in the same PR as code changes
7. **Version specificity** - Include version numbers for dependencies
8. **Avoid duplication** - Link to authoritative sources instead of copying

## Recommended Actions

### Archive Historical Files

Consider moving these files to an `archive/` directory or removing them entirely:
- IMPLEMENTATION_SUMMARY.md
- AUTUMN_IMPLEMENTATION_SUMMARY.md
- UI_CHANGES.md
- UI_CHANGES_AUTUMN.md

Their information is already incorporated into the main documentation files.

### Consolidate Information

If keeping historical files:
1. Add a prominent notice at the top: "⚠️ Historical document - may contain outdated information"
2. Link to the current authoritative documentation
3. Clearly date the document

## Documentation Review Checklist

Before each release or major PR, verify:

- [ ] README.md features list is current
- [ ] IMPLEMENTATION.md matches codebase
- [ ] UI-DESIGN.md reflects current UI
- [ ] Integration docs are accurate and complete
- [ ] Setup instructions have been tested
- [ ] Function signatures match generated API
- [ ] Version numbers are current
- [ ] Links are not broken
- [ ] Code examples compile and run
- [ ] Screenshots reflect current UI

## Getting Help

- For Convex questions: [Convex Documentation](https://docs.convex.dev)
- For TanStack questions: [TanStack Documentation](https://tanstack.com)
- For Chakra UI questions: [Chakra UI Documentation](https://chakra-ui.com)
- For Autumn questions: [Autumn Documentation](https://docs.useautumn.com)
- For Sentry questions: [Sentry Documentation](https://docs.sentry.io)
- For Firecrawl questions: [Firecrawl Documentation](https://docs.firecrawl.dev)
