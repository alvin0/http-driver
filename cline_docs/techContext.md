# Technical Context

## Technologies Used

### Core Dependencies
- TypeScript (v5.1.3)
- axios (^1.7.7)
- apisauce (^3.1.0)
- qs (^6.13.0)

### Development Dependencies
- Jest (^29.7.0)
- ts-loader (^9.5.1)

## Development Setup
1. Package is distributed via npm as `@alvin0/http-driver`
2. Installation: `npm i @alvin0/http-driver`
3. Build command: `npm run build`
4. Test command: `npm test`

## Technical Constraints
1. Requires TypeScript for type safety and proper type definitions
2. Compatible with both axios and fetch API implementations
3. Supports modern JavaScript environments with Promise support
4. URL parameters must match registered service parameters
5. GET requests automatically convert payloads to query parameters

## Repository Structure
- src/ - Main source code
- example/ - Example implementations
- dist/ - Compiled JavaScript output
