# lighthouse-aggregator
Node cmd line app to run, aggregate and compare Lighthouse tests

## Commands

### Create / Add Tests
```
yarn run add --test=testname --url=href [--name=home]

Arg       Description                          Default Value
-------   ----------------------------------   --------------
test      Name of Test Group                   n/a
url       The URL to test                      n/a
name      Test URL name (can be filtered)      home
```

### Run Tests
```
yarn run test --tests=[tests] [--loop=<# test runs>] [--filter=<URL names>]

Arg       Description                          Default Value
-------   ----------------------------------   --------------
test      Name of Test Group                   none
loop      Number of consecutive test runs      1
filter    Filter URLs to test by URL name      none
```

## Example:
### Add Test

```
yarn run add --name=fightclub --test=imdb --url=https://www.imdb.com/title/tt0137523/
yarn run add --name=fightclub --test=moviedb --url=https://www.themoviedb.org/movie/550-fight-club
yarn run add --name=amelie --test=imdb --url=https://www.imdb.com/title/tt0211915/
yarn run add --name=amelie --test=moviedb --url=https://www.themoviedb.org/movie/194-le-fabuleux-destin-d-am-lie-poulain/
```

### Run Tests
To run the `imdb` and `moviedb` test just added, 3 consecutive times, alternating between the two tests:
```
yarn run test --test=imdb,moviedb --loop=3
```

### Generate Aggregate Report for Test
To generate an aggregate report for a test:
```
yarn run report --test=imdb
```

### Compare Tests
To compare the ten test runs on the two test URL's created above:
```
yarn run compare --test=imdb,moviedb
```
