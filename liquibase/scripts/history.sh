#!/bin/bash
docker run --rm -it --network=host \
  -v $(dirname $(pwd))/changelogs:/liquibase/changelog \
  liquibase/liquibase --log-level=INFO --defaults-file=/liquibase/changelog/liquibase.docker.properties  history
