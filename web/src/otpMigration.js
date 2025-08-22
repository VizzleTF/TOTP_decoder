import protobuf from 'protobufjs';

// Google Authenticator Migration Protocol Buffer Schema
const migrationProtoSchema = {
  "nested": {
    "MigrationPayload": {
      "fields": {
        "otpParameters": {
          "rule": "repeated",
          "type": "OtpParameters",
          "id": 1
        },
        "version": {
          "type": "int32",
          "id": 2
        },
        "batchSize": {
          "type": "int32",
          "id": 3
        },
        "batchIndex": {
          "type": "int32",
          "id": 4
        },
        "batchId": {
          "type": "int32",
          "id": 5
        }
      }
    },
    "OtpParameters": {
      "fields": {
        "secret": {
          "type": "bytes",
          "id": 1
        },
        "name": {
          "type": "string",
          "id": 2
        },
        "issuer": {
          "type": "string",
          "id": 3
        },
        "algorithm": {
          "type": "Algorithm",
          "id": 4
        },
        "digits": {
          "type": "DigitCount",
          "id": 5
        },
        "type": {
          "type": "OtpType",
          "id": 6
        },
        "counter": {
          "type": "int64",
          "id": 7
        }
      }
    },
    "Algorithm": {
      "values": {
        "ALGORITHM_TYPE_UNSPECIFIED": 0,
        "SHA1": 1,
        "SHA256": 2,
        "SHA512": 3,
        "MD5": 4
      }
    },
    "DigitCount": {
      "values": {
        "DIGIT_COUNT_UNSPECIFIED": 0,
        "SIX": 1,
        "EIGHT": 2
      }
    },
    "OtpType": {
      "values": {
        "OTP_TYPE_UNSPECIFIED": 0,
        "HOTP": 1,
        "TOTP": 2
      }
    }
  }
};

// Create protobuf root and load schema
const root = protobuf.Root.fromJSON(migrationProtoSchema);
const MigrationPayload = root.lookupType('MigrationPayload');

export { MigrationPayload };
export default root;