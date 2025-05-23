#!/bin/bash

case "$1" in
  clear)
    ids=$(pm2 ls | awk '/errored|stopped/ {print $2}')
    if [ -n "$ids" ]; then
      echo "Deleting stopped or errored processes: $ids"
      pm2 delete $ids
    else
      echo "No stopped or errored processes to delete."
    fi
    ;;
  *)
    echo "Usage: $0 {clear}"
    ;;
esac
