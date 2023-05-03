#include <napi.h>
#include <fstream>
#include <iostream>
#include <string>
#include <cstdio>
#include <cstdlib>
#include <cstring>
using namespace Napi;

namespace {
    const char* counterKey = "counterStartingPoint";
}


// can use better parser actually
// skipping for now
Napi::Value JSONParse(const Napi::Env& env, const Napi::String& contents) {
    Napi::Object json = env.Global().Get("JSON").As<Napi::Object>();
    Napi::Function parse = json.Get("parse").As<Napi::Function>();
    return parse.Call(json, { contents });
}

Value ReadCounterValue(const CallbackInfo& info) {
    Env env = info.Env();

    // reads filename
    if (info.Length() < 1) {
        TypeError::New(env, "filename not passed").ThrowAsJavaScriptException();
        return env.Null();
    }
    std::string filename = info[0].ToString().Utf8Value();

    std::ifstream file(filename);
    if (!file.is_open()) {
        Error::New(env, "cannot open file").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string contents((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

    Napi::Value parsedValue = JSONParse(env, Napi::String::New(env, contents)).ToObject().Get(counterKey);
    // Check if the parsed value is a number
    if (parsedValue.IsNumber()) {
        return Number::New(env, parsedValue.ToNumber());
    }
    else {
        // Handle the case where the parsed value is not a number
        Error::New(env, "Parsed value is not a number" + filename).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// Write a JavaScript object to a JSON file
void WriteCounterValue(const CallbackInfo& info) {
  Env env = info.Env();

  // Get the filename and value arguments
  if (info.Length() < 2) {
    TypeError::New(env, "missing an argument").ThrowAsJavaScriptException();
    return;
  }
  
  std::string filename = info[0].ToString().Utf8Value();
  std::ofstream file(filename);
  if (!file.is_open()) {
    Error::New(env, "Failed to open file").ThrowAsJavaScriptException();
    return;
  }
  int value = info[1].ToNumber().Int32Value();
  file << "{\"" << counterKey << "\":" << value << "}";
}

Object Init(Env env, Object exports) {
  exports.Set(String::New(env, "ReadCounterValue"), Function::New(env, ReadCounterValue));
  exports.Set(String::New(env, "WriteCounterValue"), Function::New(env, WriteCounterValue));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)