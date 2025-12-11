# System Design Document: Doctor Appointment Booking System

## Executive Summary

This document outlines the architecture and scalability considerations for a production-grade Doctor Appointment Booking System, similar to platforms like RedBus or BookMyShow. The system is designed to handle high concurrency, prevent overbooking, and scale to millions of users.

## 1. High-Level System Architecture

### 1.1 Component Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Web App   │────▶│  API Gateway │────▶│  Load       │
│  (React)    │     │  (Kong/Nginx)│     │  Balancer   │
┌─────────────┐     └──────────────┘     └─────────────┘
│  Mobile App │                              │
└─────────────┘                              │
                                             ▼
                                    ┌─────────────────┐
                                    │  Application    │
                                    │  Servers        │
                                    │  (Node.js)      │
                                    └─────────────────┘
                                             │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
            ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
            │  PostgreSQL  │      │   Redis      │      │   RabbitMQ   │
            │  (Primary)   │      │   (Cache)    │      │   (Queue)    │
            └──────────────┘      └──────────────┘      └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  PostgreSQL  │
            │  (Replicas)  │
            └──────────────┘
```

### 1.2 Key Components

1. **API Gateway**: Single entry point for all requests, handles authentication, rate limiting, and routing
2. **Application Servers**: Stateless Node.js/Express servers handling business logic
3. **Database Layer**: PostgreSQL with read replicas for scalability
4. **Cache Layer**: Redis for frequently accessed data and session management
5. **Message Queue**: RabbitMQ/Kafka for asynchronous processing and decoupling
6. **CDN**: For static assets and improved global performance

## 2. Database Design and Scaling

### 2.1 Current Schema

**Tables:**
- `doctors`: Doctor information
- `appointment_slots`: Available slots with seat counts
- `bookings`: User bookings with status tracking

**Key Design Decisions:**
- Foreign key constraints ensure referential integrity
- Indexes on frequently queried columns (doctor_id, start_time, status)
- Check constraints prevent invalid data (negative seats, invalid statuses)
- Triggers for automatic timestamp updates

### 2.2 Scaling Strategies

#### 2.2.1 Database Sharding

**Horizontal Sharding by Doctor ID:**
```
Shard 1: Doctors 1-1000
Shard 2: Doctors 1001-2000
Shard 3: Doctors 2001-3000
...
```

**Benefits:**
- Distributes load across multiple database servers
- Enables parallel processing
- Reduces single point of failure

**Challenges:**
- Cross-shard queries become complex
- Data migration and rebalancing
- Maintaining referential integrity

**Implementation:**
- Use consistent hashing for shard selection
- Implement shard routing middleware
- Consider using Citus (PostgreSQL extension) for automatic sharding

#### 2.2.2 Read Replicas

**Architecture:**
```
Primary DB (Write) ──▶ Replica 1 (Read)
                   ──▶ Replica 2 (Read)
                   ──▶ Replica 3 (Read)
```

**Benefits:**
- Distributes read load
- Improves query performance
- Provides high availability

**Implementation:**
- Use PostgreSQL streaming replication
- Route read queries to replicas
- Use connection pooling (PgBouncer) for efficient connections

#### 2.2.3 Partitioning

**Time-based Partitioning:**
- Partition `appointment_slots` by month/year
- Partition `bookings` by month/year
- Archive old partitions to cold storage

**Benefits:**
- Faster queries on recent data
- Easier maintenance and cleanup
- Improved index performance

## 3. Concurrency Control Mechanisms

### 3.1 Current Implementation

**Database-Level Locking:**
```sql
SELECT * FROM appointment_slots WHERE id = $1 FOR UPDATE;
```

**Transaction Isolation:**
- All booking operations wrapped in transactions
- SERIALIZABLE isolation level for critical operations
- Atomic seat reservation and booking creation

### 3.2 Production Enhancements

#### 3.2.1 Pessimistic Locking (Current Approach)
- **Pros**: Prevents race conditions, guarantees consistency
- **Cons**: Can cause lock contention under high load
- **Use Case**: Critical booking operations

#### 3.2.2 Optimistic Locking
```sql
UPDATE appointment_slots 
SET available_seats = available_seats - $1, version = version + 1
WHERE id = $2 AND version = $3 AND available_seats >= $1;
```
- **Pros**: Better performance, no blocking
- **Cons**: Requires retry logic for conflicts
- **Use Case**: High-traffic scenarios with acceptable retry rates

#### 3.2.3 Distributed Locking (Redis)
```javascript
const lock = await redis.set(`lock:slot:${slotId}`, 'locked', 'EX', 5, 'NX');
if (lock) {
  // Proceed with booking
} else {
  // Retry or reject
}
```
- **Pros**: Works across multiple application servers
- **Cons**: Additional dependency, network latency
- **Use Case**: Multi-server deployments

#### 3.2.4 Message Queue Pattern
```
User Request → Queue → Worker → Database
```
- **Pros**: Decouples booking from user request, enables rate limiting
- **Cons**: Asynchronous, requires status polling
- **Use Case**: Peak traffic handling, payment processing

### 3.3 Recommended Hybrid Approach

1. **Fast Path**: Optimistic locking for most bookings
2. **Retry Path**: Queue-based processing for failed optimistic locks
3. **Critical Path**: Pessimistic locking for high-value bookings
4. **Distributed Locking**: For multi-region deployments

## 4. Caching Strategy

### 4.1 Cache Layers

#### 4.1.1 Application-Level Cache (Redis)

**Cache Keys:**
- `slot:{id}`: Slot details (TTL: 5 minutes)
- `slots:available`: List of available slots (TTL: 1 minute)
- `doctor:{id}`: Doctor information (TTL: 1 hour)
- `booking:{id}`: Booking details (TTL: 10 minutes)

**Cache Invalidation:**
- Write-through: Update cache on writes
- Write-behind: Update cache asynchronously
- TTL-based: Automatic expiration

#### 4.1.2 Database Query Cache
- Cache frequently executed queries
- Invalidate on related table updates
- Use PostgreSQL's built-in query cache

#### 4.1.3 CDN Caching
- Static assets (images, CSS, JS)
- API responses for public data (doctor lists)
- Edge caching for global performance

### 4.2 Cache Patterns

**Cache-Aside (Lazy Loading):**
```javascript
let slot = await redis.get(`slot:${id}`);
if (!slot) {
  slot = await db.getSlot(id);
  await redis.set(`slot:${id}`, slot, 'EX', 300);
}
```

**Write-Through:**
```javascript
await db.updateSlot(id, data);
await redis.set(`slot:${id}`, data, 'EX', 300);
```

**Write-Behind:**
```javascript
await redis.set(`slot:${id}`, data);
// Async: Update database in background
```

## 5. Message Queue Usage

### 5.1 Use Cases

#### 5.1.1 Booking Processing
```
Booking Request → Queue → Worker → Database → Notification
```

**Benefits:**
- Decouples user request from processing
- Enables rate limiting and throttling
- Provides retry mechanism
- Handles peak traffic gracefully

#### 5.1.2 Notification Service
```
Booking Confirmed → Queue → Email Service
                  → Queue → SMS Service
                  → Queue → Push Notification
```

#### 5.1.3 Analytics and Reporting
```
Booking Event → Queue → Analytics Service
             → Queue → Reporting Service
```

### 5.2 Queue Architecture

**Primary Queue (RabbitMQ/Kafka):**
- `booking.requests`: New booking requests
- `booking.expiry`: Expired booking cleanup
- `notifications`: User notifications
- `analytics`: Event tracking

**Dead Letter Queue:**
- Failed processing attempts
- Manual review and retry

**Priority Queues:**
- High-priority bookings (VIP users, urgent appointments)
- Regular bookings

## 6. Performance Optimization

### 6.1 Database Optimization

- **Connection Pooling**: PgBouncer for efficient connection management
- **Query Optimization**: Proper indexes, query analysis, EXPLAIN plans
- **Batch Operations**: Bulk inserts/updates where possible
- **Materialized Views**: Pre-computed aggregations for reporting

### 6.2 Application Optimization

- **Async Processing**: Non-blocking I/O operations
- **Request Batching**: Combine multiple queries where possible
- **Compression**: Gzip responses for API endpoints
- **Rate Limiting**: Prevent abuse and ensure fair usage

### 6.3 Monitoring and Observability

- **APM Tools**: New Relic, Datadog for performance monitoring
- **Logging**: Centralized logging (ELK stack)
- **Metrics**: Prometheus + Grafana for real-time metrics
- **Alerting**: Automated alerts for critical issues

## 7. High Availability and Disaster Recovery

### 7.1 High Availability

- **Multi-Region Deployment**: Active-active or active-passive
- **Database Replication**: Synchronous for critical data, asynchronous for scale
- **Load Balancing**: Health checks and automatic failover
- **Circuit Breakers**: Prevent cascade failures

### 7.2 Disaster Recovery

- **Backup Strategy**: Daily full backups, hourly incremental backups
- **Replication**: Cross-region database replication
- **RTO/RPO**: Recovery Time Objective < 1 hour, Recovery Point Objective < 15 minutes
- **Failover Testing**: Regular disaster recovery drills

## 8. Security Considerations

- **Authentication**: JWT tokens, OAuth 2.0
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS in transit, encryption at rest
- **SQL Injection Prevention**: Parameterized queries (already implemented)
- **Rate Limiting**: Prevent DDoS and abuse
- **Input Validation**: Comprehensive validation (already implemented)
- **Audit Logging**: Track all critical operations

## 9. Scalability Estimates

### 9.1 Current Capacity (Single Server)
- **Throughput**: ~1,000 requests/second
- **Concurrent Users**: ~10,000
- **Database Size**: Up to 100GB

### 9.2 Scaled Capacity (Production)
- **Throughput**: 100,000+ requests/second (with load balancing)
- **Concurrent Users**: 1,000,000+
- **Database Size**: Petabytes (with sharding and archiving)

## 10. Cost Optimization

- **Auto-scaling**: Scale down during low traffic
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical workloads
- **Data Archiving**: Move old data to cheaper storage (S3 Glacier)

## 11. Migration Path

### Phase 1: Current Implementation
- Single database, basic caching
- ✅ **Completed**

### Phase 2: Read Replicas
- Add read replicas
- Implement read/write splitting
- **Timeline**: 2-3 weeks

### Phase 3: Caching Layer
- Implement Redis caching
- Cache frequently accessed data
- **Timeline**: 1-2 weeks

### Phase 4: Message Queue
- Integrate RabbitMQ/Kafka
- Move booking processing to queue
- **Timeline**: 2-3 weeks

### Phase 5: Sharding
- Implement database sharding
- Migrate existing data
- **Timeline**: 1-2 months

### Phase 6: Multi-Region
- Deploy to multiple regions
- Implement global load balancing
- **Timeline**: 2-3 months

## Conclusion

This system design provides a roadmap for scaling the Doctor Appointment Booking System from a single-server deployment to a production-grade, globally distributed platform. The architecture prioritizes:

1. **Reliability**: Through replication, backups, and failover mechanisms
2. **Scalability**: Through sharding, caching, and load balancing
3. **Performance**: Through optimization, caching, and efficient database design
4. **Maintainability**: Through clean architecture, monitoring, and documentation

The system can handle growth from thousands to millions of users while maintaining data consistency and preventing overbooking through robust concurrency control mechanisms.

