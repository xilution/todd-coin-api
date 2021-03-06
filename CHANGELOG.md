# [1.15.0](https://github.com/xilution/todd-coin-api/compare/v1.14.0...v1.15.0) (2022-06-09)


### Features

* updated @xilution/todd-coin-utils version ([0b42a5d](https://github.com/xilution/todd-coin-api/commit/0b42a5d0a888ce333a50ae4bf8ba8f67f90852e7))

# [1.14.0](https://github.com/xilution/todd-coin-api/compare/v1.13.0...v1.14.0) (2022-06-01)


### Features

* allow null for participant and organization parameters ([1535631](https://github.com/xilution/todd-coin-api/commit/153563188a83349b7209eb12ffbc5fc64a573919))

# [1.13.0](https://github.com/xilution/todd-coin-api/compare/v1.12.1...v1.13.0) (2022-05-18)


### Features

* removed authentication for gets ([10eda0c](https://github.com/xilution/todd-coin-api/commit/10eda0c10aad0d9ca3b1e560f789d5c62379ab26))

## [1.12.1](https://github.com/xilution/todd-coin-api/compare/v1.12.0...v1.12.1) (2022-05-14)


### Bug Fixes

* fixed signing transactions ([b92999e](https://github.com/xilution/todd-coin-api/commit/b92999ef6788d351a5a102351d005816db877755))

# [1.12.0](https://github.com/xilution/todd-coin-api/compare/v1.11.0...v1.12.0) (2022-05-10)


### Bug Fixes

* fixed effective date range validation ([4cabccb](https://github.com/xilution/todd-coin-api/commit/4cabccb6850ed7bde5cfa6166c83d7c1c9190c1e))


### Features

* moved todd-coin-types back to deps ([34eff47](https://github.com/xilution/todd-coin-api/commit/34eff476810107709b4d4d181c34de516b2016b3))

# [1.11.0](https://github.com/xilution/todd-coin-api/compare/v1.10.0...v1.11.0) (2022-05-10)


### Bug Fixes

* fixed error response for post block when participant key is not found ([4c76229](https://github.com/xilution/todd-coin-api/commit/4c762299582855f8920eb0d4f36d5220450f17cf))
* fixed logging ([a200523](https://github.com/xilution/todd-coin-api/commit/a200523977cbecdfe2bb8278cf5d42eb7aef6617))
* improved a bad request error response ([cfd5f2d](https://github.com/xilution/todd-coin-api/commit/cfd5f2d7eba21a9ba574fc7c51f7a0c4543a16bd))
* improved authentication instructions ([e756e35](https://github.com/xilution/todd-coin-api/commit/e756e35eeb3666d0d3c50f71facdb58d626be624))
* improved bad request error when organization already exists ([9ab6b29](https://github.com/xilution/todd-coin-api/commit/9ab6b2927785e8f3711a2b85a711a349b31eba55))
* improved error message when participant already exists ([9bc434d](https://github.com/xilution/todd-coin-api/commit/9bc434dc842173fe97a4ac39733ce682abecaa60))
* improved logging ([8a73d07](https://github.com/xilution/todd-coin-api/commit/8a73d079e7a69b380daf1447a867d9a690a068d9))


### Features

* added logging ([f78f341](https://github.com/xilution/todd-coin-api/commit/f78f34116814fd0b34c572d2f43cfe425516e4ea))
* added logging ([f0cf147](https://github.com/xilution/todd-coin-api/commit/f0cf1476261f7c0af7053329bb49103acbc82320))
* added logging ([32796fd](https://github.com/xilution/todd-coin-api/commit/32796fd6da02f46a5acacdf9fdc19715ae45de55))
* added logging ([93445d5](https://github.com/xilution/todd-coin-api/commit/93445d52aaa98f18b5259080e7610c511c9484a3))
* added logging ([afb0369](https://github.com/xilution/todd-coin-api/commit/afb0369d44d2046ccf2339d0b67c741fc1893ece))
* added logging when posting a block ([3417912](https://github.com/xilution/todd-coin-api/commit/3417912fef76f738b19155953945c9dff35a8230))
* added logging when posting and updating a node ([00a398d](https://github.com/xilution/todd-coin-api/commit/00a398da019688a8520baa57233ea18387ced7e3))
* bumped todd-coin-brokers version ([f6aed50](https://github.com/xilution/todd-coin-api/commit/f6aed5062fe92bf3850ef9da272323f67f4af228))
* changed response serializer ([d5eb002](https://github.com/xilution/todd-coin-api/commit/d5eb002eaabb8992ea8758a247242dbe43a8dc31))
* controlled for duplicate nodes ([8ceda0b](https://github.com/xilution/todd-coin-api/commit/8ceda0b48fbb0a8043b1454816b9062012385453))
* logging authentication ([d1dc40c](https://github.com/xilution/todd-coin-api/commit/d1dc40c00527ab5d7e5c34c9d9b010c82b2a2c44))
* removed private from create participant key validation ([7c8f452](https://github.com/xilution/todd-coin-api/commit/7c8f4524276bb83542ea4b0aaafeaff59dfe5b2e))
* restricted create and update attributes ([c71721a](https://github.com/xilution/todd-coin-api/commit/c71721af25aa4a2f1c450effa51fff278e5b2196))
* restricted duplicate participant keys ([56a108f](https://github.com/xilution/todd-coin-api/commit/56a108f30ed72523ffaf583bce90d93a89a81d52))
* restricted who can create and update a participant keys ([1a36657](https://github.com/xilution/todd-coin-api/commit/1a366575c529a78dea6256bfbba4452b3bf04172))
* restricted who can sign a transaction ([4bd084f](https://github.com/xilution/todd-coin-api/commit/4bd084f4696dca53ab870ddf52a6d8fe637ff319))
* restricted who can update a participant ([3e0c063](https://github.com/xilution/todd-coin-api/commit/3e0c063a62af328d4ea4cf4e812762947dd9883d))
* validated that from is greater than or equal-to to date ([a69b64f](https://github.com/xilution/todd-coin-api/commit/a69b64f770fa5087a1c195ae8e387d08076ba38c))
* validated that the path id matches the request body id ([685ab29](https://github.com/xilution/todd-coin-api/commit/685ab29c9395bc34eff574b1ba19511dfdacc5a3))
* validated to and from participants ([bd7e9d0](https://github.com/xilution/todd-coin-api/commit/bd7e9d0c842f0fa1f1e6b7401369520bcdba9b26))

# [1.10.0](https://github.com/xilution/todd-coin-api/compare/v1.9.0...v1.10.0) (2022-05-07)


### Bug Fixes

* adapted to optional password ([c1b3377](https://github.com/xilution/todd-coin-api/commit/c1b3377b822b2dd91a3ea93a15dc0ae52a416c04))
* fixed from/to filters ([eee1f5f](https://github.com/xilution/todd-coin-api/commit/eee1f5f204f79f056774947bcc7a134b3e0364b9))


### Features

* added a detail to the bad request error ([d1e5aa8](https://github.com/xilution/todd-coin-api/commit/d1e5aa81ed2517d18f7f20ef3757b8f8c321409c))
* added better response documentation ([f721871](https://github.com/xilution/todd-coin-api/commit/f7218715d12228001e6a0b4cd5bfc9e61d51a751))
* bumped todd-coin-brokers version ([634e1ae](https://github.com/xilution/todd-coin-api/commit/634e1ae1c442b6c5c0fbc8b21dc13df66bd63c8d))
* bumped todd-coin-brokers, todd-coin-types and todd-coin-utils versions ([5c5b0cc](https://github.com/xilution/todd-coin-api/commit/5c5b0cc120bb719c9868117f8cbf8df520e00962))
* checking for duplicate participants ([87a20fb](https://github.com/xilution/todd-coin-api/commit/87a20fb109522273f57cf60b804cdb971f471717))
* controlled for duplicate orgs ([215038a](https://github.com/xilution/todd-coin-api/commit/215038a9f06cb75ef30012112f27ba86856c0581))
* controlled for duplicate participants ([16a7908](https://github.com/xilution/todd-coin-api/commit/16a7908d7e602a3f9589cb3772d5f34b2b13c98f))
* removed email requirement for organizations ([801a5e2](https://github.com/xilution/todd-coin-api/commit/801a5e2e3da5bdb1960f6d2d3db4bb5e5e0e01a8))
* removed password requirement for participants ([09c3c76](https://github.com/xilution/todd-coin-api/commit/09c3c7603a3afbf1dc26ab49bb9c590b9e11343c))

# [1.9.0](https://github.com/xilution/todd-coin-api/compare/v1.8.0...v1.9.0) (2022-05-05)


### Features

* bumped todd-coin-brokers version ([0cb0bb4](https://github.com/xilution/todd-coin-api/commit/0cb0bb4b3ea48ca7b7c9d3b67c0603a84fc9645b))

# [1.8.0](https://github.com/xilution/todd-coin-api/compare/v1.7.0...v1.8.0) (2022-05-05)


### Bug Fixes

* improved participant keys ([4882b73](https://github.com/xilution/todd-coin-api/commit/4882b73c74cfe8455eb5cd7c7259e4eb3ad3ffb7))


### Features

* bumped todd-coin-brokers, todd-coin-types and todd-coin-utils versions ([82b6a9e](https://github.com/xilution/todd-coin-api/commit/82b6a9ed0ec4d43783265a4fb8adf824544fdd22))
* improved signed transactions ([a7267c0](https://github.com/xilution/todd-coin-api/commit/a7267c032e6809a47d131486b94e7a8e1ef2e57b))

# [1.7.0](https://github.com/xilution/todd-coin-api/compare/v1.6.0...v1.7.0) (2022-05-03)


### Features

* cleaned up pending transactions ([d8810cd](https://github.com/xilution/todd-coin-api/commit/d8810cd8dc023cd9447fa4288abdf8a93a6afff2))

# [1.6.0](https://github.com/xilution/todd-coin-api/compare/v1.5.0...v1.6.0) (2022-05-03)


### Bug Fixes

* fixed block transaction response serializers ([2b11cc3](https://github.com/xilution/todd-coin-api/commit/2b11cc3bd68a0b4da2c111c2cd4553369a2e6fdc))


### Features

* added relations ([46c6adb](https://github.com/xilution/todd-coin-api/commit/46c6adb4300933e23cb28ce831aeb064da7c26b4))

# [1.5.0](https://github.com/xilution/todd-coin-api/compare/v1.4.1...v1.5.0) (2022-05-02)


### Features

* documentation and api clean up ([f3ec803](https://github.com/xilution/todd-coin-api/commit/f3ec803c5ec7d75414abd28098812f8b34bc7c5f))

## [1.4.1](https://github.com/xilution/todd-coin-api/compare/v1.4.0...v1.4.1) (2022-04-28)


### Bug Fixes

* signaled up to metrics ([ba05200](https://github.com/xilution/todd-coin-api/commit/ba052000a50590169255fc410d8e0196f30655e8))

# [1.4.0](https://github.com/xilution/todd-coin-api/compare/v1.3.0...v1.4.0) (2022-04-28)


### Features

* added metrics ([a4eb57d](https://github.com/xilution/todd-coin-api/commit/a4eb57d5f818b872b963f7bf03505567e78db554))

# [1.3.0](https://github.com/xilution/todd-coin-api/compare/v1.2.0...v1.3.0) (2022-04-28)


### Features

* added swagger api documentation ([447d077](https://github.com/xilution/todd-coin-api/commit/447d077bf89daa5fed0f5980b5baa44327610289))

# [1.2.0](https://github.com/xilution/todd-coin-api/compare/v1.1.0...v1.2.0) (2022-04-28)


### Features

* added patch endpoints ([58e7feb](https://github.com/xilution/todd-coin-api/commit/58e7febf949013f6463054d6612b83293f410a74))

# [1.1.0](https://github.com/xilution/todd-coin-api/compare/v1.0.1...v1.1.0) (2022-04-27)


### Features

* added org/participant reference endpoints ([9723ad8](https://github.com/xilution/todd-coin-api/commit/9723ad8fbc064d8329c8d9dcabdd63b0f86e5bcd))
* added org/participant reference endpoints ([d3a5078](https://github.com/xilution/todd-coin-api/commit/d3a5078e69d87552cb0c6d30dc97931c7b69b0fc))

## [1.0.1](https://github.com/xilution/todd-coin-api/compare/v1.0.0...v1.0.1) (2022-04-22)


### Bug Fixes

* integrated changes to brokers ([ea35c04](https://github.com/xilution/todd-coin-api/commit/ea35c04fceb3203cd098c0d1b5e677b94db091ae))

# 1.0.0 (2022-04-15)


### Bug Fixes

* fixed an error message punctuation ([052fa20](https://github.com/xilution/todd-coin-api/commit/052fa2048609d25842a5713b0b453c686220817a))


### Features

* added forbidden error response ([45c90d5](https://github.com/xilution/todd-coin-api/commit/45c90d5c54f968b2a5f204c9cf9f897a37f1f5cd))
* improved the root node description ([e547331](https://github.com/xilution/todd-coin-api/commit/e5473311f82da54dacfb1636133b5127fb004c23))

# [1.1.0](https://github.com/xilution/todd-coin-api/compare/v1.0.0...v1.1.0) (2022-04-15)


### Features

* improved the root node description ([e547331](https://github.com/xilution/todd-coin-api/commit/e5473311f82da54dacfb1636133b5127fb004c23))

# 1.0.0 (2022-04-15)


### Bug Fixes

* fixed an error message punctuation ([052fa20](https://github.com/xilution/todd-coin-api/commit/052fa2048609d25842a5713b0b453c686220817a))
