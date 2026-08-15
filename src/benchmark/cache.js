const URL = "http://localhost:3000/products/1"

const measure = async () => {
    const start = performance.now()

    await fetch(URL)

    const end = performance.now()

    return end - start
}

const run = async () => {
    console.log("Benchmark Redis cache\n")
    console.log("First request (expected MISS):")
    console.log(`${(await measure()).toFixed(2)} ms \n`)
    console.log("Following requests (expected HIT):")

    const results = []

    for (let i = 0; i < 20; i++) {
        results.push(await measure())
    }

    const average = results.reduce((sum, value) => sum + value, 0) / results.length

    console.log(`Average: ${average.toFixed(2)} ms`)
}

run()