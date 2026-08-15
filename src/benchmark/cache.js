const URL = "http://localhost:3000/products/1"
const CONCURRENT_REQUESTS = 100

const measure = async () => {
    const start = performance.now()

    await fetch(URL)

    return performance.now() - start
}

const percentile = (values, percentile) => {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1

    return sorted[Math.max(index, 0)]
}

const average = (values) => {
    return values.reduce((sum, value) => sum + value, 0) / values.length
}

const run = async () => {
    console.log("Cache benchmark\n")

    const firstRequest = await measure()
    const results = await Promise.all(
        Array.from(
            { length: CONCURRENT_REQUESTS },
            () => measure()
        )
    )

    console.log(`First request: ${firstRequest.toFixed(2)} ms`)
    console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`)
    console.log(`Average: ${average(results).toFixed(2)} ms`)
    console.log(`Min: ${Math.min(...results).toFixed(2)} ms`)
    console.log(`Max: ${Math.max(...results).toFixed(2)} ms`)
    console.log(`P50: ${percentile(results, 50).toFixed(2)} ms`)
    console.log(`P95: ${percentile(results, 95).toFixed(2)} ms`)
    console.log(`P99: ${percentile(results, 99).toFixed(2)} ms`)
}

run()