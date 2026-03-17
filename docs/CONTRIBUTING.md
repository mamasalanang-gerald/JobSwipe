# Contributing Guide

## Code of Conduct

We follow a code of conduct that ensures a welcoming environment for all contributors.

## How to Contribute

### 1. Create an Issue
Before starting work, create an issue describing:
- What problem you're solving
- How you plan to solve it
- Any questions or concerns

### 2. Create a Feature Branch
```bash
git checkout -b feature/issue-description
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `perf/` - Performance improvements

### 3. Commit Messages

Use conventional commits:
```
feat: add job recommendations
fix: resolve authentication bug
docs: update API documentation
refactor: improve job service structure
perf: optimize database queries
test: add user authentication tests
```

Format: `<type>: <description>`

### 4. Code Review Checklist

Before submitting PR, ensure:
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No console logs left in code
- [ ] No commented-out code
- [ ] No hardcoded values/secrets

### 5. Pull Request Process

1. Push feature branch to repository
2. Create PR with meaningful description
3. Link related issues
4. Await code review
5. Address review comments
6. Request re-review after changes
7. Merge once approved

PR Template:
```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation

## Testing
Describe testing done:
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] No new warnings generated
- [ ] Tests pass
- [ ] Documentation updated
```

## Style Guides

### PHP (Laravel)

Follow PSR-12:
```php
<?php

declare(strict_types=1);

namespace App\Services;

final class UserService
{
    public function createUser(string $email, string $password): User
    {
        // Implementation
    }
    
    private function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
}
```

Rules:
- Strict types declaration
- Type hints on all parameters and returns
- Private methods and properties
- Final classes unless inheritance needed
- Single responsibility principle

### JavaScript/TypeScript

```typescript
// File: src/services/userService.ts

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export const createUser = async (
  data: CreateUserRequest
): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data;
};
```

Rules:
- Use TypeScript for type safety
- Named exports preferred
- Interfaces for data structures
- Consistent naming (camelCase)
- Proper error handling

### React Components

```tsx
// File: src/components/UserCard.tsx

interface UserCardProps {
  user: User;
  onSelect: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  return (
    <div className="card" onClick={() => onSelect(user.id)}>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email}</p>
    </div>
  );
};

UserCard.displayName = 'UserCard';
```

Rules:
- Functional components with TypeScript
- Props interface defined
- Display name for debugging
- No inline styles
- Reusable and composable

### Testing

Tests should be clear and follow AAA pattern (Arrange, Act, Assert):

```php
// PHP
public function testUserCanLogin()
{
    // Arrange
    $user = User::factory()->create([
        'password' => bcrypt('password')
    ]);
    
    // Act
    $response = $this->post('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password'
    ]);
    
    // Assert
    $response->assertOk();
    $response->assertJsonStructure(['data' => ['token']]);
}
```

```typescript
// JavaScript
describe('userService', () => {
  it('should create user with valid data', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'pass' };
    
    // Act
    const user = await createUser(userData);
    
    // Assert
    expect(user.email).toBe('test@example.com');
  });
});
```

## Development Workflow

### Setting up Development Environment

1. Fork and clone repository
2. Create feature branch
3. Install dependencies
4. Start Docker containers
5. Run migrations
6. Start development servers

### Before Commit

1. Format code
   ```bash
   # PHP
   cd backend
   vendor/bin/pint
   
   # JavaScript
   cd frontend/web
   npm run lint -- --fix
   ```

2. Run tests
   ```bash
   # Backend
   cd backend
   php artisan test
   
   # Frontend
   cd frontend/web
   npm test
   ```

3. Check for issues
   ```bash
   # Backend
   cd backend
   php artisan check
   ```

### Performance Guidelines

1. **Database**
   - Never N+1 queries
   - Use eager loading
   - Add indexes for frequently queried fields
   - Cache expensive queries

2. **API**
   - Return only needed fields
   - Implement pagination
   - Use asynchronous processing for heavy operations
   - Compress responses

3. **Frontend**
   - Lazy load components
   - Memoize components
   - Optimize images
   - Bundle analysis

## Reporting Issues

Use GitHub issues to report:
- Bugs
- Feature requests
- Documentation improvements
- Performance issues

Include:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment info (OS, browser, versions)
- Relevant logs or screenshots

## Security Issues

**Do not** create public issues for security vulnerabilities.

Email security concerns to: security@jobapp.local

## Resources

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Getting Help

- Check existing issues and discussions
- Ask in PR comments
- Join our community chat (if available)
- Read documentation first

Thank you for contributing! 🎉
