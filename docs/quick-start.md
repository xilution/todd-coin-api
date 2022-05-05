1. export TODD_COIN_API_BASE_URL=http://localhost:3000
2. *** start postgres via docker
3. *** init via the todd-coin task docker job
4. *** sync via the todd-coin task docker job
5. mkdir -p todd-coin-data
6. todd-coin create-participant $TODD_COIN_API_BASE_URL tbrunia20@gmail.com secret > ./todd-coin-data/participant-1.json && cat ./todd-coin-data/participant-1.json
7. export TODD_COIN_PARTICIPANT_1_ID=`cat ./todd-coin-data/participant-1.json | jq '.id' -r`
8. export TODD_COIN_PARTICIPANT_1_PRIVATE_KEY=`cat ./todd-coin-data/participant-1.json | jq '.keys | .[0] | .private' -r`
9. todd-coin create-participant $TODD_COIN_API_BASE_URL tbrunia21@gmail.com secret > ./todd-coin-data/participant-2.json && cat ./todd-coin-data/participant-2.json
10. export TODD_COIN_PARTICIPANT_2_ID=`cat ./todd-coin-data/participant-2.json | jq '.id' -r`
11. todd-coin get-access-token $TODD_COIN_API_BASE_URL tbrunia6@gmail.com secret > ./todd-coin-data/access-token.json && cat ./todd-coin-data/access-token.json
12. export TODD_COIN_ACCESS_TOKEN=`cat ./todd-coin-data/access-token.json | jq '.access' -r`
13. export TODD_COIN_FROM_DATE=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
14. export TODD_COIN_TO_DATE=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
15. env | grep TODD_COIN
16. todd-coin create-pending-transaction $TODD_COIN_API_BASE_URL $TODD_COIN_ACCESS_TOKEN "just cause" $TODD_COIN_PARTICIPANT_1_ID $TODD_COIN_PARTICIPANT_1_ID $TODD_COIN_FROM_DATE $TODD_COIN_TO_DATE > ./todd-coin-data/pending-transaction-1.json && cat ./todd-coin-data/pending-transaction-1.json
17. export TODD_COIN_PENDING_TRANSACTION_1_ID=`cat ./todd-coin-data/pending-transaction-1.json | jq '.id' -r`
18. todd-coin sign-pending-transaction $TODD_COIN_API_BASE_URL $TODD_COIN_ACCESS_TOKEN 10 $TODD_COIN_PARTICIPANT_1_PRIVATE_KEY $TODD_COIN_PENDING_TRANSACTION_1_ID > ./todd-coin-data/signed-transaction-1.json && cat ./todd-coin-data/signed-transaction-1.json
19. *** mine via the todd-coin task docker job
20. *** sync via the todd-coin task docker job
21. rm -rf ./todd-coin-data

participant 1 is a member of a charity
participant 2 is a volunteer

in the mobile app, when a volunteer creates a pending transaction, they should be able to look up a participant by their email address
the volunteer can create an unclaimed participant with the email address
the todd-coin api or the tasks will send an email to the owner of the account inviting them to activate their account and sign the transaction